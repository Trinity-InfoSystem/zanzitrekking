const MetaTagItem = ({ link, name }) => {
  return (
    <a
      href={link}
      className="mb-2 mr-2 block rounded bg-primary/5 px-5 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-white md:mr-4 lg:mr-2 xl:mr-4"
    >
      {name}
    </a>
  );
};

export default MetaTagItem;
