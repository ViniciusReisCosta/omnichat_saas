import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasActivePaymentAccess } from '@/lib/auth';

type AccessOptions = {
  requirePayment?: boolean;
};

export async function requireAccess(req: NextRequest, options: AccessOptions = {}) {
  const { requirePayment = true } = options;
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (user.role !== 'super_admin' && !user.company) {
    return {
      error: NextResponse.json({ error: 'No company associated with this user' }, { status: 403 }),
    };
  }

  if (user.role !== 'super_admin' && user.company && !user.company.active && user.company.paymentStatus === 'paid') {
    return {
      error: NextResponse.json({ error: 'Your company account is deactivated' }, { status: 403 }),
    };
  }

  if (requirePayment && !hasActivePaymentAccess(user)) {
    return {
      error: NextResponse.json(
        {
          error: 'Active payment required',
          code: 'PAYMENT_REQUIRED',
          paymentStatus: user.company?.paymentStatus ?? 'pending',
        },
        { status: 402 }
      ),
    };
  }

  return { user };
}

export function canAccessCompany(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>, companyId: string) {
  if (user.role === 'super_admin') return true;
  return user.companyId === companyId;
}

export function ensureCompanyAccess(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>, companyId: string) {
  if (!canAccessCompany(user, companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

export function enforceSameOrigin(req: NextRequest) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return null;
  }

  const origin = req.headers.get('origin');
  if (!origin) return null;

  const requestOrigin = req.nextUrl.origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (origin !== requestOrigin && origin !== configuredOrigin) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  return null;
}
