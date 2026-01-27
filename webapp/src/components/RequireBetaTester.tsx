import { UserRoles } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";

interface RequireBetaTesterProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to restrict access to beta testers only.
 * Can be used to wrap parts of a page or an entire page content.
 */
export default function RequireBetaTester({ children, fallback }: RequireBetaTesterProps) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return null;
    }

    const isBetaTester = session?.user?.roles?.includes(UserRoles.BETA_TESTER);

    if (!isBetaTester) {
        return fallback || null;
    }

    return <>{children}</>;
}
