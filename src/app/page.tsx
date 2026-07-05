import { Hero } from "@/components/sections/hero";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Expertise } from "@/components/sections/expertise";
import { AiLabPreview } from "@/components/sections/ai-lab-preview";
import { Timeline } from "@/components/sections/timeline";
import { BlogPreview } from "@/components/sections/blog-preview";
import { Contact } from "@/components/sections/contact";
import { getAllPosts } from "@/lib/blog";
import { Freelance } from "@/components/sections/freelance";

export default function HomePage() {
  const posts = getAllPosts();
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <Freelance />
      <Expertise />
      <AiLabPreview />
      <Timeline />
      <BlogPreview posts={posts} />
      <Contact />
    </>
  );
}
