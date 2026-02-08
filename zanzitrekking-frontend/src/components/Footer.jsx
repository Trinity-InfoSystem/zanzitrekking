"use client";

import { useDispatch, useSelector } from "react-redux";
import { get_footer_blogs } from "../store/reducers/blogPostReducer";
import { useEffect } from "react";
import FooterNewsletter from "./Footer/FooterNewsletter";
import FooterMainContent from "./Footer/FooterMainContent";
import FooterBottomBar from "./Footer/FooterBottomBar";

const Footer = () => {
  const dispatch = useDispatch();
  const { footerBlogs } = useSelector((state) => state.blog);
  const { pdfs } = useSelector((state) => state.pdf);

  useEffect(() => {
    dispatch(get_footer_blogs({ perPage: 2, currentPage: 1, searchValue: "" }));
  }, [dispatch]);

  return (
    <footer className="relative z-10 bg-white">
      <FooterNewsletter />
      <FooterMainContent blogPosts={footerBlogs} pdfs={pdfs} />
      <FooterBottomBar />
    </footer>
  );
};

export default Footer;
