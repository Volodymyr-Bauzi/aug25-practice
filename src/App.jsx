/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  ); // find by product.categoryId
  const user = usersFromServer.find(person => person.id === category.ownerId); // find by category.ownerId

  return {
    ...product,
    category,
    person: user,
  };
});

const getFilteredGoods = (goods, { user, query }) => {
  let filteredGoods = [...goods];

  if (user) {
    filteredGoods = filteredGoods.filter(good => good.person === user);
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    filteredGoods = filteredGoods.filter(good => {
      return good.name.toLowerCase().includes(normalizedQuery);
    });
  }

  return filteredGoods;
};

export const App = () => {
  const [goods] = useState(products);
  const [people] = useState(usersFromServer);
  const [categories] = useState(categoriesFromServer);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');

  const filteredGoods = getFilteredGoods(goods, {
    user,
    query,
  });

  const resetAllFilters = () => {
    setUser(null);
    setQuery('');
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                onClick={() => setUser(null)}
                data-cy="FilterAllUsers"
                href="#/"
                className={!user ? 'is-active' : ''}
              >
                All
              </a>

              {people.map(person => (
                <a
                  onClick={() => setUser(person)}
                  data-cy="FilterAllUsers"
                  href="#/"
                  className={person === user ? 'is-active' : ''}
                  key={person.id}
                >
                  {person.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value.trimStart())}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
              >
                All
              </a>

              {categories.map(category => (
                <a
                  data-cy="Category"
                  className="button mr-2 my-1 is-info"
                  href="#/"
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!filteredGoods ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-down" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-up" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredGoods.map(good => {
                  const { category, person } = good;

                  return (
                    <tr data-cy="Product" key={good.id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {good.id}
                      </td>

                      <td data-cy="ProductName">{good.name}</td>
                      <td data-cy="ProductCategory">
                        {category.icon} - {category.title}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={`${person.sex === 'm' ? 'has-text-link' : 'has-text-danger'}`}
                      >
                        {person.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
