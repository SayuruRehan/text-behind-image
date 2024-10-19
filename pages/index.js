import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

const Home = () => {
  return (
    <div>
      <Editor />
    </div>
  );
};

export default Home;
