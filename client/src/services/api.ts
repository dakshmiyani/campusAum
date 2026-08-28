import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setTenantHeaders(orgId: string, campusId: string, instId: string) {
  api.defaults.headers.common['x-organization-id'] = orgId;
  api.defaults.headers.common['x-campus-id'] = campusId;
  api.defaults.headers.common['x-institute-id'] = instId;
}

export default api;
