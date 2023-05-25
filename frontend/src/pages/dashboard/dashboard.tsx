import { Loader } from '../../components/loader';
import { useUser } from './hooks';

export const Dashboard = () => {
  const { isLoading, me, isSuccess } = useUser();
  return (
    <div>
      <h1>Dashboard</h1>
      {isLoading && <Loader />}
      {isSuccess && (
        <div>
          <h2>User: </h2>
          <pre>{JSON.stringify(me, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
