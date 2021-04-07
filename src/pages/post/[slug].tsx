import { useMemo } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { getPrismicClient } from "../../services/prismic";
import Header from "../../components/Header";

import commonStyles from "../../styles/common.module.scss";
import styles from "./post.module.scss";

interface IPost {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface IPostProps {
  post: IPost;
}

const formatDate = (date: string, formatString = "dd MMM yyyy"): string => {
  return format(new Date(date), formatString, { locale: ptBR });
};

function Post({ post }: IPostProps): JSX.Element {
  const { isFallback } = useRouter();

  const { first_publication_date, last_publication_date, data } = post;
  const { content, title, banner, author } = data;

  const readingTime = useMemo(
    () =>
      content.reduce((total, contentPiece) => {
        const words = RichText.asText(contentPiece.body)
          .split(/[^\w]/)
          .filter(word => word !== "");
        return total + Math.ceil(words.length / 200);
      }, 0),
    [content]
  );

  const publicationDate = useMemo(() => formatDate(first_publication_date), [
    first_publication_date,
  ]);

  const lastPublicationDate = useMemo(
    () => formatDate(last_publication_date, "dd MMM yyyy, 'às' H:mm"),
    [last_publication_date]
  );

  const wasEdited = last_publication_date !== first_publication_date;

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{title} | spacetraveling</title>
      </Head>

      <Header />

      <img src={banner.url} alt="" className={styles.banner} />

      <main className={commonStyles.container}>
        <div className={styles.post}>
          <h1>{title}</h1>

          <div className={commonStyles.postStats}>
            <time>
              <FiCalendar />
              {publicationDate}
            </time>
            <span>
              <FiUser />
              {author}
            </span>
            <span>
              <FiClock />
              {`${readingTime} min`}
            </span>
          </div>

          {wasEdited && (
            <span className={styles.editInfo}>
              {`* editado em ${lastPublicationDate}`}
            </span>
          )}

          <article>
            {content.map(contentPart => (
              <section key={contentPart.heading}>
                <h2>{contentPart.heading}</h2>

                {contentPart.body.map((paragraph, index) => {
                  const key = `${contentPart.heading}-paragraph-${index}`;
                  return <p key={key}>{paragraph.text}</p>;
                })}
              </section>
            ))}
          </article>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    Prismic.predicates.at("document.type", "post")
  );

  const slugs = results.map(post => post.uid);
  const paths = slugs.map(slug => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("post", String(slug), {});

  const { data, first_publication_date, last_publication_date, uid } = response;
  const { title, subtitle, banner, content, author } = data;

  const post: IPost = {
    uid,
    first_publication_date,
    last_publication_date,
    data: {
      title,
      subtitle,
      author,
      banner: {
        url: banner.url,
      },
      content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

export default Post;
export { getStaticProps };
