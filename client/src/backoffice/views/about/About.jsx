// COMPONENTS
import ViewContainer from "../../components/ui/ViewContainer";
import ViewTitle from "../../components/ui/ViewTitle";

export default function About() {
    return (
      <ViewContainer>
        <ViewTitle title="About EasyLiquor POS" subtitle="Your all-in-one solution for liquor store management." />
        <div className="flex items-left justify-start mt-[20px]">
            <div className="text-sm text-gray-700">
              <p><strong>Version:</strong> v2.0 Beta</p>
              <p><strong>Build:</strong> April 2025</p>
              <p><strong>Developed by:</strong> Joe LoMoglio</p>
            </div>
        </div>
      </ViewContainer>
    )
  }