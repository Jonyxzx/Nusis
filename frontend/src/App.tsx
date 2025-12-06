import { Toaster } from "@/components/ui/sonner";
import { AuthControls } from "@/components/AuthControls";
import { AuthBasedContent } from "@/components/AuthBasedContent";

export default function App() {
  return (
    <div className='min-h-screen admin-content dark'>
      <div className='admin-header'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div
              className='h-10 w-10 rounded-lg flex items-center justify-center cursor-pointer'
              onClick={() => (window.location.href = "/")}
            >
              <img src='/NUSIS.svg' alt='NUSIS Logo' width={40} height={40} />
            </div>
            <div>
              <h1 className='text-primary-foreground'>NUSIS Admin Portal</h1>
              <p className='text-sm text-secondary-content'>
                Admin Dashboard for NUSIS personnel
              </p>
            </div>
            <div className='ml-auto text-primary-foreground'>
              {/* Show login or logout depending on auth state */}
              <AuthControls />
            </div>
          </div>
        </div>
      </div>

      <AuthBasedContent />

      <Toaster />
    </div>
  );
}
