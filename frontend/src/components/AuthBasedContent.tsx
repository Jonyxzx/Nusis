import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCampaigns } from "@/components/EmailCampaigns";
// import { Financials } from "@/components/Financials";
import { Mail, Clock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { EmailHistory } from "@/components/EmailHistory";

function AuthBasedContent() {
  const { user } = useAuth();
  if (!user) return <div className='container mx-auto py-8' />; // empty page other than header

  return (
    <div className='admin-header'>
      <div className='container mx-auto px-6'>
        <Tabs defaultValue='email' className='w-full'>
          <TabsList className='h-auto bg-transparent border-0 gap-2 p-0'>
            <TabsTrigger
              value='email'
              className='gap-2 text-muted-foreground data-[state=active]:text-primary-content data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4'
            >
              <Mail className='h-4 w-4' />
              Email
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='gap-2 text-muted-foreground data-[state=active]:text-primary-content data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4'
            >
              <Clock className='h-4 w-4' />
              History
            </TabsTrigger>
            {/* <TabsTrigger
              value='financials'
              className='gap-2 text-muted-foreground data-[state=active]:text-primary-content data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4'
            >
              <DollarSign className='h-4 w-4' />
              Financials
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value='email' className='mt-0'>
            <div className='container mx-auto py-8'>
              <EmailCampaigns />
            </div>
          </TabsContent>

            <TabsContent value='history' className='mt-0'>
            <div className='container mx-auto py-8'>
              <EmailHistory />
            </div>
          </TabsContent>

          {/* <TabsContent value='financials' className='mt-0'>
            <div className='container mx-auto py-8'>
              <Financials />
            </div>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}

export { AuthBasedContent };
