import { ReactElement, useState } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import Prismic from "@prismicio/client";
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { getPrismicClient } from "../services/prismic";
import Header from "../components/Header";

import commonStyles from "../styles/common.module.scss";
import styles from "./home.module.scss";

interface IPost {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface IPostPagination {
  next_page: string;
  results: IPost[];
}

interface IHomeProps {
  postsPagination: IPostPagination;
}

const formatPost = (post: IPost): IPost => {
  const first_publication_date = format(
    new Date(post.first_publication_date),
    "dd MMM yyyy",
    { locale: ptBR }
  );

  return { ...post, first_publication_date };
};

function Home({ postsPagination }: IHomeProps): ReactElement {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(
    postsPagination.results.map(post => formatPost(post))
  );

  const handleLoadMorePosts = async (): Promise<void> => {
    if (nextPage) {
      const response = await fetch(nextPage);
      const parsedResponse = await response.json();
      const newPosts = parsedResponse.results.map(post => formatPost(post));

      setNextPage(parsedResponse.next_page);
      setPosts([...posts, ...newPosts]);
    }
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <section className={styles.posts}>
          {posts.map(post => (
            <article key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>

              <p>{post.data.subtitle}</p>

              <div className={commonStyles.postStats}>
                <time>
                  <FiCalendar />
                  {post.first_publication_date}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </article>
          ))}
        </section>

        {nextPage && (
          <button
            type="button"
            onClick={() => handleLoadMorePosts()}
            className={styles.loadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.subtitle", "post.author"],
      pageSize: 100,
    }
  );

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
  };
};

export default Home;
