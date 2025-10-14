import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { EmailCampaigns } from "./components/EmailCampaigns";
import { Financials } from "./components/Financials";
import { Mail, DollarSign } from "lucide-react";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className='min-h-screen admin-content dark'>
      <div className='admin-header'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground'>
              <img src="/NUSIS.svg" alt="NUSIS Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-primary-foreground">NUSIS Admin Portal</h1>
              <p className='text-sm text-secondary-content'>
                Admin Dashboard for NUSIS personnel
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='admin-header'>
        <div className='container mx-auto px-6'>
          <Tabs defaultValue='email' className='w-full'>
            <TabsList className='h-auto bg-transparent border-0 gap-2 p-0'>
              <TabsTrigger
                value='email'
                className='gap-2 text-muted-foreground data-[state=active]:text-primary-content data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4'
              >
                <Mail className='h-4 w-4' />
                Email Campaigns
              </TabsTrigger>
              <TabsTrigger
                value='financials'
                className='gap-2 text-muted-foreground data-[state=active]:text-primary-content data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4'
              >
                <DollarSign className='h-4 w-4' />
                Financials
              </TabsTrigger>
            </TabsList>

            <TabsContent value='email' className='mt-0'>
              <div className='container mx-auto py-8'>
                <EmailCampaigns />
              </div>
            </TabsContent>

            <TabsContent value='financials' className='mt-0'>
              <div className='container mx-auto py-8'>
                <Financials />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
