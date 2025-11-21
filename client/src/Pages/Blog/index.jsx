import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { IoMdTime } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchDataFromApi(`/api/blog/${id}`).then((res) => {
        setBlog(res?.blog);
        setLoading(false);
      }).catch((err) => {
        console.error("Error fetching blog:", err);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
          <Link to="/" className="link text-primary">Go Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 bg-white min-h-screen">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="link text-primary flex items-center gap-2 mb-6">
            <IoIosArrowForward className="rotate-180" /> Back to Home
          </Link>

          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="w-full overflow-hidden">
              <LazyLoadImage
                alt={blog?.title}
                effect="blur"
                className="w-full h-auto"
                src={blog?.images?.[0]}
              />
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center text-white bg-primary rounded-md px-3 py-1 text-[12px] font-[500] gap-1">
                  <IoMdTime className="text-[16px]" /> {blog?.createdAt?.split("T")[0]}
                </span>
              </div>

              <h1 className="text-[24px] lg:text-[32px] font-[700] text-black mb-4">
                {blog?.title}
              </h1>

              <div 
                className="text-[14px] lg:text-[16px] text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog?.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetail;

