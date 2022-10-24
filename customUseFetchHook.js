import { useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

const useFetch = (url) => {
  const initialState = {
    status: 'idle',
    error: null,
    data: null,
  };
  const FetchReducer = (state, action) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...state, status: 'fetching' };
      case 'FETCHED':
        return { ...state, data: action.payload, status: 'fetched' };
      case 'FETCH_ERROR':
        return { ...state, error: action.payload, status: 'error' };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(FetchReducer, initialState);

  // Memoizing data from request:
  const cache = useMemo(
    () => ({
      data: state.data,
    }),
    [url]
  );

  useEffect(() => {
    if (!url) return;
    dispatch({ type: 'FETCHING' });

    // JavaScript AbortController allows to abort request.
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      if (cache.data) {
        dispatch({ type: 'FETCHED', payload: cache.data });
      } else {
        try {
          const res = await fetch(url, { signal });
          const data = await res.json();
          dispatch({ type: 'FETCHED', payload: data });
        } catch (err) {
          dispatch({ type: 'FETCH_ERROR', payload: err.message });
        }
      }
    };

    fetchData();

    // Here when you leave the React component, instead of fetching data it aborts the request:
    return () => controller.abort;
  }, [cache]);

  return state;
};

useFetch.propTypes = {
  url: PropTypes.string.isRequired,
};

export default useFetch;
