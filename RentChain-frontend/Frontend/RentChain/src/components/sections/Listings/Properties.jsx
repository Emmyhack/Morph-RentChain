import { useEffect, useState, useCallback } from "react";
import PropertyCard from "../../ui/PropertyCard";
import Filter from "../../ui/Filter";
import { useContracts } from '../../../hooks/useContracts';

const PROPERTIES_PER_PAGE = 6;

export default function Properties() {
  const { getAvailableProperties, getProperty } = useContracts();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch properties from blockchain
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const propertyIds = await getAvailableProperties(0, 50); // Fetch up to 50 for demo
      const propertyDetails = [];
      for (const id of propertyIds) {
        const property = await getProperty(id);
        if (property) propertyDetails.push(property);
      }
      setProperties(propertyDetails);
      setFilteredProperties(propertyDetails);
    } catch (err) {
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  }, [getAvailableProperties, getProperty]);

  useEffect(() => {
    fetchProperties();
    const interval = setInterval(fetchProperties, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchProperties]);

  const handleFilterChange = useCallback((filtered) => {
    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const startIdx = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIdx = startIdx + PROPERTIES_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIdx, endIdx);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="w-full section-page !py-52 !pt-60">
      <h2 className="mb-10 text-5xl font-semibold text-primary">Properties</h2>

      <div className="flex flex-wrap-reverse items-start w-full gap-10 lg:flex-nowrap">
        <div className="lg:flex-[2] w-full">
          <Filter properties={properties} onFilterChange={handleFilterChange} />
        </div>

        <div className="lg:flex-[6] w-full">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <span className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid"></span>
              <span className="ml-8 text-3xl text-secondary">Loading properties...</span>
            </div>
          ) : currentProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <span className="text-5xl text-gray-400 mb-6">🏠</span>
              <span className="text-3xl text-secondary">No properties available at the moment.</span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                className="px-4 py-2 text-2xl rounded bg-gray-200 hover:bg-primary hover:text-white disabled:opacity-50"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 text-2xl rounded ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-primary hover:text-white'}`}
                  onClick={() => goToPage(i + 1)}
                  disabled={totalPages === 0}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-4 py-2 text-2xl rounded bg-gray-200 hover:bg-primary hover:text-white disabled:opacity-50"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
