import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useAppMetafields } from '@shopify/ui-extensions/checkout/preact';


export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const longDelivery = useAppMetafields({
    namespace: 'custom',
    key: 'long_delivery',
    type: 'product',
  });

  // Helper function to extract numeric ID from GID
  const extractIdFromGid = (gid) => {
    if (typeof gid === 'string' && gid.includes('/')) {
      return gid.split('/').pop();
    }
    return gid;
  };

  const hasLongDelivery = shopify.lines.value.some((line) => {
    const productGid = line.merchandise.product.id;
    const productId = extractIdFromGid(productGid);

    const metafieldEntry = longDelivery.find(
      (entry) => entry.target.id === productId || entry.target.id === productGid
    );

    return metafieldEntry?.metafield?.value === 'true'
  });

  return (
    hasLongDelivery && (
      <s-banner heading={shopify.i18n.translate("someItemshavelongDeliveryTimes")} tone='critical'>
        <s-text>
          {shopify.i18n.translate("checkEstimatedDeliveryTime")}
        </s-text>
      </s-banner>
    )
  );
}