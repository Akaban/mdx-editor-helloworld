// Shim for @radix-ui/react-collection to avoid parsing issues with private class fields
// Implements the legacy createCollection API used by Radix primitives.

import * as React from "react";
import { createContextScope } from "@radix-ui/react-context";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { createSlot } from "@radix-ui/react-slot";

export function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] =
    createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] =
    createCollectionContext(PROVIDER_NAME, {
      collectionRef: { current: null },
      itemMap: new Map(),
    });

  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React.useRef(null);
    const itemMap = React.useRef(new Map()).current;
    return React.createElement(CollectionProviderImpl, {
      scope,
      itemMap,
      collectionRef: ref,
      children,
    });
  };
  CollectionProvider.displayName = PROVIDER_NAME;

  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = React.forwardRef((props, forwardedRef) => {
    const { scope, children } = props;
    const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
    const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
    return React.createElement(CollectionSlotImpl, {
      ref: composedRefs,
      children,
    });
  });
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;

  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = React.forwardRef((props, forwardedRef) => {
    const { scope, children, ...itemData } = props;
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const context = useCollectionContext(ITEM_SLOT_NAME, scope);
    React.useEffect(() => {
      context.itemMap.set(ref, { ref, ...itemData });
      return () => void context.itemMap.delete(ref);
    });
    const extraProps = {};
    extraProps[ITEM_DATA_ATTR] = "";
    return React.createElement(CollectionItemSlotImpl, {
      ...extraProps,
      ref: composedRefs,
      children,
    });
  });
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;

  function useCollection(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(
        collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`),
      );
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) =>
          orderedNodes.indexOf(a.ref.current) -
          orderedNodes.indexOf(b.ref.current),
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }

  return [
    {
      Provider: CollectionProvider,
      Slot: CollectionSlot,
      ItemSlot: CollectionItemSlot,
    },
    useCollection,
    createCollectionScope,
  ];
}

// Some consumers import unstable_createCollection; map it to createCollection
export const unstable_createCollection = createCollection;

export default createCollection;
