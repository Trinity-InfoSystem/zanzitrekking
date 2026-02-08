import { User } from "lucide-react";

const BlogAuthor = ({ image, name }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-200">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-500">
            Written by
          </span>
        </div>
        <span className="text-lg font-semibold text-neutral-900">{name}</span>
      </div>
    </div>
  );
};

export default BlogAuthor;
