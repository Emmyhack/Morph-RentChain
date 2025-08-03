import { useState, useEffect } from "react";
import { FiRotateCw } from "react-icons/fi";

export default function Filter({ properties, onFilterChange }) {
  const [price, setPrice] = useState(10000);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All");

  // Get all unique types from the properties
  const types = ["All", ...Array.from(new Set(properties.map((p) => p.type)))];

  useEffect(() => {
    let result = properties;

    if (propertyType !== "All") {
      result = result.filter((p) => p.type === propertyType);
    }

    if (location.trim() !== "") {
      result = result.filter((p) => 
        p.location.toLowerCase().includes(location.trim().toLowerCase())
      );
    }

    result = result.filter((p) => p.price <= price);

    onFilterChange(result);
  }, [price, location, propertyType, properties, onFilterChange]);

  const handleReset = () => {
    setPrice(10000);
    setLocation("");
    setPropertyType("All");
  };

  return (
    <div className="w-full p-10 space-y-10 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-semibold">Filters</h2>
        <button onClick={handleReset} title="Reset filters">
          <FiRotateCw className="text-4xl text-gray-500 transition cursor-pointer hover:-rotate-90 hover:text-black" />
        </button>
      </div>

      {/* Property Type Dropdown */}
      <div>
        <label className="block mb-3 text-3xl font-medium">Property Type</label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full h-[5.5rem] cursor-pointer p-2 border rounded-xl text-3xl font-medium normal-case text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {types.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Slider */}
      <div>
        <label className="block mb-2 text-[1.7rem] font-medium">
          Price Range: $0 - ${price.toLocaleString()}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          className="w-full accent-black"
        />
        <div className="flex justify-between mt-1 text-2xl text-gray-500">
          <span>$0</span>
          <span>$10,000+</span>
        </div>
      </div>

      {/* Location Input */}
      <div>
        <label className="block mb-3 text-3xl font-medium">Location</label>
        <input
          type="text"
          placeholder="Enter city or area"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full h-[5.5rem] text-2xl font-medium p-2 border rounded-xl normal-case focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Active Filters */}
      <div className="pt-2 text-[1.7rem] border-t">
        <p className="mt-2 mb-3 text-3xl font-semibold">Active Filters:</p>
        <p>Type: {propertyType}</p>
        <p>Price: $0 - ${price.toLocaleString()}</p>
      </div>
    </div>
  );
}
