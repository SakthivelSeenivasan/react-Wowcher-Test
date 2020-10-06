import React, { useState, useEffect } from 'react';

import './App.css';

import {
  API_ROUTE,
  fuzzyMatch,
  formatNumber,
  isDuplicateProduct,
  fetchRequest,
} from './Utility';

const App = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // request all data in parallel
        const data = (
          await Promise.all([
            fetchRequest(`${API_ROUTE}/branch1.json`),
            fetchRequest(`${API_ROUTE}/branch2.json`),
            fetchRequest(`${API_ROUTE}/branch3.json`),
          ])
        )
          ?.reduce((acc, curr) => [...acc, ...(curr?.products ?? [])], [])
          ?.reduce((acc, curr) => {
            const duplicate = acc?.find((item) =>
              isDuplicateProduct(item, curr)
            );

            if (!!duplicate) {
              return acc?.map((item) =>
                item === duplicate
                  ? { ...duplicate, sold: item?.sold + curr?.sold }
                  : item
              );
            }
            return [...acc, curr];
          }, []);

        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.log({ error });
      }
    })();
  }, []);

  const filteredProducts = products?.filter(({ name }) =>
    fuzzyMatch(name?.toLowerCase(), query?.toLowerCase())
  );

  if (loading) return 'Loading...';

  return (
    <div className="container">
      <h1>Products</h1>
      <div className="product-list">
        <div className="product-list-search">
          <label htmlFor="search">Search Products</label>
          <div className="product-list-search-input">
            <input
              id="search"
              placeholder="e.g. Apple"
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !!filteredProducts?.length ? (
          <div className="product-list-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts
                  ?.sort((a, b) => (a?.name > b?.name ? 1 : -1))
                  ?.map(({ id, name, sold, unitPrice }) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{formatNumber(sold * unitPrice)}</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>
                    {formatNumber(
                      filteredProducts?.reduce(
                        (acc, { sold, unitPrice }) => acc + sold * unitPrice,
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p>Products not found.</p>
        )}
      </div>
    </div>
  );
};

export default App;
