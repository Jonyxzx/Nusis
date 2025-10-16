import express from 'express';
import passport from 'passport';

const router = express.Router();

// Start auth - redirects to Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}`, session: true }),
  (req, res) => {
    // Redirect back to frontend root without query params
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
);

// Logout
router.post('/auth/logout', (req, res, next) => {
  // If there's no session, nothing to do
  if (!req.session) {
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  }

  // Use the callback form of req.logout to ensure Passport finishes cleanup
  // and avoid internal calls that assume a session exists.
  try {
    req.logout?.((err: any) => {
      // ignore logout error but attempt to destroy session
      req.session!.destroy((destroyErr: any) => {
        res.clearCookie('connect.sid');
        if (err || destroyErr) {
          console.error('Logout error', err || destroyErr);
          return res.status(500).json({ ok: false });
        }
        return res.json({ ok: true });
      });
    });
  } catch (e) {
    // Fallback: ensure session destroyed
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  }
});

export default router;