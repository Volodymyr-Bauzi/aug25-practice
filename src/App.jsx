/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const COLUMNS = ['ID', 'Product', 'Category', 'User'];

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

const getFilteredGoods = (goods, { user, query, selected, sorting }) => {
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

  if (selected.length > 0) {
    filteredGoods = filteredGoods.filter(good => {
      return selected.find(item => item.id === good.categoryId);
    });
  }

  if (sorting.column) {
    filteredGoods.sort((a, b) => {
      switch (sorting.column) {
        case 'ID': {
          return a.id - b.id;
        }

        case 'Product': {
          return a.name.localeCompare(b.name);
        }

        case 'Category': {
          return a.category.title.localeCompare(b.category.title);
        }

        case 'User': {
          return a.person.name.localeCompare(b.person.name);
        }

        default: {
          throw new Error('Unknown value in sorting.column');
        }
      }
    });
  }

  if (sorting.order === 'desc') {
    filteredGoods.reverse();
  }

  return filteredGoods;
};

export const App = () => {
  const [goods] = useState(products);
  const [people] = useState(usersFromServer);
  const [categories] = useState(categoriesFromServer);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc');

  const filteredGoods = getFilteredGoods(goods, {
    user,
    query,
    selected: selectedCategories,
    sorting: {
      column: sortingColumn,
      order: sortingOrder,
    },
  });

  const handleSelectCategory = category => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => {
        return prev.filter(item => item.id !== category.id);
      });
    } else {
      setSelectedCategories(prev => {
        return [...prev, category];
      });
    }
  };

  const isSelected = selectedId => {
    return selectedCategories.find(category => category.id === selectedId);
  };

  const resetAllFilters = () => {
    setUser(null);
    setQuery('');
  };

  const handleSorting = newColumn => {
    if (sortingColumn !== newColumn) {
      setSortingColumn(newColumn);
      setSortingOrder('asc');
    } else if (sortingOrder === 'asc') {
      setSortingOrder('desc');
    } else {
      setSortingColumn(null);
      setSortingOrder('asc');
    }
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
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categories.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': isSelected(category.id),
                  })}
                  href="#/"
                  onClick={() => handleSelectCategory(category)}
                  key={category.id}
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
          {!filteredGoods.length > 0 ? (
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
                  {COLUMNS.map(column => (
                    <th key={column}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}
                        <a href="#/" onClick={() => handleSorting(column)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn(
                                'fas',
                                {
                                  'fa-sort': sortingColumn !== column,
                                },
                                {
                                  'fa-sort-up':
                                    sortingColumn === column &&
                                    sortingOrder === 'asc',
                                },
                                {
                                  'fa-sort-down':
                                    sortingColumn === column &&
                                    sortingOrder === 'desc',
                                },
                              )}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
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
