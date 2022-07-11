export type PlainObject = { [name: string]: unknown };

export type ForceUpdateIfMounted = () => void;

// ComponentMap stores all of the currently subscribed components for a given key
type ComponentMap = Map<string, ForceUpdateIfMounted>;
