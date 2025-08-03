import { IoLocationOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, ButtonTwo } from "../common/Button";
import { FaRegEdit } from "react-icons/fa";
import { useWeb3 } from "../../hooks/useWeb3";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname;
  const { userRole } = useWeb3();

  const handleClick = () => {
    const basePath = pathName.includes("tenant-dashboard") ? "/dashboard/tenant-dashboard/properties" : "/dashboard/landlord-dashboard/properties";

    navigate(`${basePath}/${property.id}`, {
      state: {
        title: property.title,
        location: property.location,
        country: property.country,
        price: property.price,
        duration: property.duration,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        type: property.type,
        image: property.image,
        listed_date: property.listed_date,
        amenities: property.amenities,
        map: property.map,
        description: property.description,
      },
    });
  };

  return (
    <div className={`glass-card p-7 group rounded-xl hover:shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
      <div className="relative w-full">
        <span className="absolute px-4 py-2 text-2xl font-medium text-white rounded-full top-5 left-5 bg-primary/80">{property.type}</span>
        {property.createdAt && (Date.now() - new Date(property.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
          <span className="absolute top-5 right-5 bg-green-600 text-white text-xl font-bold px-4 py-2 rounded-full shadow-lg z-10 animate-pulse">
            New
          </span>
        )}
        <img src={property.image} alt={property.title} className="object-cover w-full h-[30rem] mb-4 rounded-md" />
      </div>

      <div className="flex flex-col justify-between w-full gap-10">
        <div className="w-full">
          <h3 className="mb-2 text-3xl font-semibold">{property.title}</h3>
          <p className="mt-4 text-[1.7rem] text-gray-500 flex items-center gap-x-2">
            <IoLocationOutline className="text-4xl" />
            {property.location}, {property.country}
          </p>
          <p className="py-6 text-5xl font-bold text-primary">
            ${property.price.toLocaleString()}
            <span className="text-2xl normal-case text-secondary">/{property.duration}</span>
          </p>
          <p className="mt-2 text-2xl text-secondary">
            {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
          </p>
        </div>

        {pathName === "/dashboard/tenant-dashboard/properties" ? (
          property.available ? (
            <Button name="View Details" className="flex justify-center w-full mt-10" onClick={() => handleClick(property)} />
          ) : (
            <p className="mt-16 text-3xl font-semibold text-center normal-case text-secondary">Property not available</p>
          )
        ) : (
          <>
            <ButtonTwo
              name="edit property"
              icon={<FaRegEdit className="text-4xl" />}
              className="flex justify-center w-full mt-10 border border-gray-300"
              onClick={() => navigate(`/dashboard/landlord-dashboard/properties/edit/${property.id}`)}
            />
            {property.leaseAgreementUrl ? (
              <Button
                name="View Lease Agreement"
                className="flex justify-center w-full mt-4 border border-green-500 text-green-700"
                onClick={() => window.open(property.leaseAgreementUrl, '_blank')}
              />
            ) : (
              <span className="block mt-4 text-xl text-yellow-600 text-center font-medium">No lease agreement uploaded</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
