import ReactReduxContext from './context';
import Subscription from './Subscription';
import React, { useEffect, useMemo } from 'react';

const Provider = ({ store, children }) => {
    const contextValue = useMemo(() => {
        const subscription = new Subscription(store);
        return {
            store,
            subscription
        }
    }, [store]);
    // 监听 store 变化
    useEffect(() => {
        const { subscription } = contextValue;
        subscription.trySubscribe();
        return () => {
            subscription.unsubscribe();
        }
    }, [contextValue]);
    return (
        <ReactReduxContext.Provider value={contextValue}>
            {children}
        </ReactReduxContext.Provider>
    )
}
export default Provider;