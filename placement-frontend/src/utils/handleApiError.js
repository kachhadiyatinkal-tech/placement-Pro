export default function handleApiError(error) {
  const data = error?.response?.data || {};
  const message = data?.message || data?.msg || error?.message || 'Request failed';
  const errors = data?.errors && typeof data.errors === 'object' ? data.errors : {};

  return {
    message,
    errors,
    status: error?.response?.status,
    raw: data,
  };
}
