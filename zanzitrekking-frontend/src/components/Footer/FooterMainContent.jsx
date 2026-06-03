import FooterCompanyInfo from "./FooterCompanyInfo";
import FooterBlogPosts from "./FooterBlogPosts";
import FooterDownloads from "./FooterDownloads";
import FooterQuickLinks from "./FooterQuickLinks";
import FooterContactInfo from "./FooterContactInfo";

const FooterMainContent = ({ blogPosts, pdfs }) => {
  return (
    <div className="border-t border-neutral-200 bg-white px-4 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <FooterCompanyInfo />
          <FooterBlogPosts blogPosts={blogPosts} />
          <FooterDownloads pdfs={pdfs?.pdfs || pdfs} />
          <FooterQuickLinks />
          <FooterContactInfo />
        </div>
      </div>
    </div>
  );
};

export default FooterMainContent;
