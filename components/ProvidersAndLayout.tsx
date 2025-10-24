import { BaseProvider } from "@/components/BaseProvider";
import { Navigation } from "@/components/Navigation";

export type ProvidersAndLayoutProps = {
  children: React.ReactNode;
}

export function ProvidersAndLayout(props: ProvidersAndLayoutProps) {

  const { children } = props;

  return (
    <BaseProvider>
      <div
        className={`max-w-screen w-full min-h-screen p-4 font-montreal bg-[#0C0F1D] bg-gradient-to-b from-[#0C0F1D80] to-[#97F0E580] from-[77.3%] flex flex-col text-[#F7F7F7] gap-4`}
      >
        <div
          className="relative h-max w-full flex flex-col items-center px-4 md:px-8 lg:px-10 pb-8 pt-8 border-[3px] border-[#99EFE4] rounded-xl overflow-hidden bg-[#090e1d]"
        >
          <div className="z-10 w-full">
            <div className="sticky top-0 left-0 right-0 px-2 sm:px-4 py-4 bg-gradient-to-b from-[#090e1d] from-60% via-[#090e1d]/80 via-75% to-transparent mb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full mb-4">
                <div className="flex flex-row gap-1 items-center justify-center sm:justify-start">
                  <span className={`font-neuebit text-2xl sm:text-3xl`}>
                    BASE
                  </span>
                  <span className={`font-neuebit text-2xl sm:text-3xl font-bold text-[#C684F6]`}>
                    SCAPE
                  </span>
                  <div className="ml-2 px-2 py-1 bg-[#97F0E5]/20 border border-[#97F0E5] rounded-md">
                    <span className="text-xs font-neuebit text-[#97F0E5]">BUILT ON BASE</span>
                  </div>
                </div>
              </div>
              <Navigation />
            </div>
            {children}
          </div>
        </div>
      </div>
    </BaseProvider>
  )
}