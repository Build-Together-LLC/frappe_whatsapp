import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// const UserListSkeleton = ({listItems, user}:any, ) => {
//   return (

//   Array(listItems).fill(0).map((_,index)=>
//   <div key={index} className='tw-w-full tw-h-[20%] tw-bg-gray-50 tw-px-2 tw-justify-between tw-items-center tw-flex tw-animate-pulse'>
//   <Skeleton height={60} width={60} circle className=' tw-bg-gray-200 ' />
//   <Skeleton height={60} width={400}  className=' tw-bg-gray-200'/>
//   </div>

//    )

//   );
// };
const UserListSkeleton = ({ listItems }: any) => {
  return (
    <div className="tw-w-full tw-h-full">
      <div className="tw-h-[10%] tw-w-full tw-bg-gray-50 tw-px-2 tw-justify-between tw-items-center tw-flex tw-animate-pulse">
        {/* You can use the user prop within the skeleton loader */}
        <div>
          <Skeleton height={30} width={30} circle className="tw-bg-gray-200" />
        </div>
        <div className="tw-w-[90%]">
          <Skeleton height={60} className="tw-bg-gray-200" />
        </div>
      </div>
      {Array(listItems)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="tw-h-[20%] tw-bg-gray-50 tw-px-2 tw-justify-between tw-items-center tw-flex tw-animate-pulse"
          >
            {/* You can use the user prop within the skeleton loader */}
            <div>
              <Skeleton
                height={45}
                width={45}
                circle
                className="tw-bg-gray-200"
              />
            </div>
            <div className="tw-w-[90%]">
              <Skeleton height={60} className="tw-bg-gray-200" />
            </div>
          </div>
        ))}
    </div>
  );
};

export default UserListSkeleton;
