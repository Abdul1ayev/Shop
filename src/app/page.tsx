import Link from 'next/link';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Link href="admin/dashboard"  className='btn btn-dark w-1/12 d-block mx-auto my-3' >Admin page</Link>
    </div>
  );
}

export default Page;
