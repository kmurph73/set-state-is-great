import { useRef } from 'react';

let uniqueId = 0;
const getUniqueId = () => uniqueId++;

// get unique id for a component
// https://gist.github.com/sqren/fc897c1629979e669714893df966b1b7
const useComponentId = (): number => {
  const idRef = useRef(getUniqueId());
  return idRef.current;
};

export default useComponentId;
