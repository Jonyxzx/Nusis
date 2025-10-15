import express from 'express';
import passport from 'passport';

const router = express.Router();

// Start auth - redirects to Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/?auth=fail`, session: true }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
  }
);

// Logout
router.post('/auth/logout', (req, res) => {
  req.logout?.(() => {});
  req.session?.destroy(() => {});
  res.clearCookie('connect.sid');
  res.json({ ok: true });
});

export default router;