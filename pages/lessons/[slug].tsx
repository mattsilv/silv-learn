import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import {
  Lesson,
  getAllLessonSlugs,
  getLessonBySlug,
} from "../../utils/lessonService";
import MicrolearningPlatform from "../../components/MicrolearningPlatform";

type LessonPageProps = {
  lesson: Lesson;
};

const LessonPage: NextPage<LessonPageProps> = ({ lesson }) => {
  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <MicrolearningPlatform lesson={lesson} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllLessonSlugs();

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      lesson,
    },
  };
};

export default LessonPage;
