import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const BlogPost = ({ id, image, title, date }) => {
  return (
    <Link
      to={`/blog/${id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:border-primary-300 hover:shadow-lg"
    >
      <div className="aspect-video overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h4 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-text-dark transition-colors group-hover:text-primary-600">
          {title}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-lighter">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-600" />
        </div>
      </div>
    </Link>
  );
};

export default BlogPost;
