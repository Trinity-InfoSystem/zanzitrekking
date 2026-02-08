import { Quote } from "lucide-react";

const BlogQuote = ({ quote, author }) => {
  return (
    <div className="relative my-8 overflow-hidden rounded-xl border-l-4 border-neutral-400 bg-neutral-50 p-8">
      <div className="mx-auto max-w-[530px]">
        <Quote className="mb-4 h-8 w-8 text-neutral-400" />
        <p className="mb-4 text-lg font-medium italic leading-relaxed text-neutral-900">
          {quote}
        </p>
        {author && (
          <span className="text-sm italic text-neutral-600">
            — {author}
          </span>
        )}
      </div>
    </div>
  );
};

export default BlogQuote;