const BlogPostSearchBar = ({ setParPage, setSearchValue, searchValue }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-primary-800">Show:</label>
      <select
        onChange={(e) => setParPage(Number(e.target.value))}
        className="rounded-lg border-2 border-primary-200 bg-white px-3 py-2 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="30">30</option>
        <option value="1200">All</option>
      </select>
    </div>
    <input
      type="text"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Search blog posts..."
      className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200 sm:w-64"
    />
  </div>
);

export default BlogPostSearchBar;
