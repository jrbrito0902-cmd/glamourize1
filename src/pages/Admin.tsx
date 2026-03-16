import { Studio } from 'sanity';
import sanityConfig from "../lib/sanity.config";

const AdminPage = () => {
  return (
    <div className="h-screen w-full overflow-hidden">
      <Studio config={sanityConfig} />
    </div>
  );
};

export default AdminPage;
