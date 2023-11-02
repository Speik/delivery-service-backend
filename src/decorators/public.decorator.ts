import { SetMetadata } from '@nestjs/common';

const PUBLIC_ROUTE_DESCRIPTOR = 'isPublic';
const Public = () => SetMetadata(PUBLIC_ROUTE_DESCRIPTOR, true);

export { Public, PUBLIC_ROUTE_DESCRIPTOR };
