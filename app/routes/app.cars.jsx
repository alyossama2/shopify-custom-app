import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams, useSubmit, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
    await authenticate.admin(request);

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const fuelType = url.searchParams.get("fuelType") || "";
    const sortBy = url.searchParams.get("sortBy") || "id";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";

    const where = {
        AND: [],
    };

    if (search) {
        where.AND.push({
            OR: [
                { brand: { contains: search } },
                { licensePlace: { contains: search } },
                { driverName: { contains: search } },
            ],
        });
    }

    if (fuelType) {
        where.AND.push({
            fuelType: {
                name: fuelType === "Petrol" ? "Gasoline" : fuelType,
            },
        });
    }

    const orderBy = {};
    if (sortBy === "fuelType") {
        orderBy.fuelType = {
            name: sortOrder,
        };
    } else {
        orderBy[sortBy] = sortOrder;
    }

    const cars = await prisma.car.findMany({
        where: where.AND.length > 0 ? where : undefined,
        include: {
            fuelType: true,
        },
        orderBy,
    });

    const fuelTypes = await prisma.carFuelType.findMany({
        orderBy: { name: "asc" },
    });

    return {
        cars,
        fuelTypes,
        search,
        fuelType,
        sortBy,
        sortOrder,
    };
};

export default function CarsPage() {
    const { cars, search: initialSearch, fuelType: initialFuelType } = useLoaderData();
    const [searchParams] = useSearchParams();
    const submit = useSubmit();

    const [search, setSearch] = useState(initialSearch);
    const [fuelType, setFuelType] = useState(initialFuelType);

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (search) {
                params.set("search", search);
            } else {
                params.delete("search");
            }
            submit(params, { method: "get" });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFuelTypeChange = (value) => {
        setFuelType(value);
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("fuelType", value);
        } else {
            params.delete("fuelType");
        }
        params.delete("search");
        setSearch("");
        submit(params, { method: "get" });
    };

    const handleSort = (column) => {
        const params = new URLSearchParams(searchParams);
        const currentSortBy = params.get("sortBy") || "id";
        const currentSortOrder = params.get("sortOrder") || "asc";

        if (currentSortBy === column) {
            params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
        } else {
            params.set("sortBy", column);
            params.set("sortOrder", "asc");
        }
        submit(params, { method: "get" });
    };

    const getSortIcon = (column) => {
        const currentSortBy = searchParams.get("sortBy") || "id";
        const currentSortOrder = searchParams.get("sortOrder") || "asc";

        if (currentSortBy !== column) {
            return "↕️";
        }
        return currentSortOrder === "asc" ? "↑" : "↓";
    };

    const filterOptions = [
        { value: "", label: "All fuel types" },
        { value: "Diesel", label: "Diesel" },
        { value: "Petrol", label: "Petrol" },
        { value: "Electric", label: "Electric" },
    ];

    return (
        <s-page heading="Cars">
            <s-section>
                <s-stack direction="block" gap="base">
                    {/* Search and Filter Controls */}
                    <s-stack direction="inline" gap="base" alignment="start">
                        <s-search-field
                            value={search}
                            onInput={(e) => setSearch(e.currentTarget.value)}
                            placeholder="Search by brand, license plate, or driver name..."
                        />
                        <select
                            value={fuelType}
                            onChange={(e) => handleFuelTypeChange(e.currentTarget.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "1px solid #d1d5db",
                                fontSize: "14px",
                                minWidth: "150px"
                            }}
                        >
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </s-stack>

                    {/* Table */}
                    {cars.length > 0 ? (
                        <s-table>
                            <s-table-header-row>
                                <s-table-header>
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("id")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        ID {getSortIcon("id")}
                                    </s-button>
                                </s-table-header>
                                <s-table-header>
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("brand")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        Brand {getSortIcon("brand")}
                                    </s-button>
                                </s-table-header>
                                <s-table-header>
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("licensePlace")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        License Plate {getSortIcon("licensePlace")}
                                    </s-button>
                                </s-table-header>
                                <s-table-header format="numeric">
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("year")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        Year {getSortIcon("year")}
                                    </s-button>
                                </s-table-header>
                                <s-table-header>
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("driverName")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        Driver Name {getSortIcon("driverName")}
                                    </s-button>
                                </s-table-header>
                                <s-table-header>
                                    <s-button
                                        variant="tertiary"
                                        onClick={() => handleSort("fuelType")}
                                        style={{ padding: 0, fontWeight: "inherit" }}
                                    >
                                        Fuel Type {getSortIcon("fuelType")}
                                    </s-button>
                                </s-table-header>
                            </s-table-header-row>
                            <s-table-body>
                                {cars.map((car) => (
                                    <s-table-row key={car.id}>
                                        <s-table-cell>{car.id}</s-table-cell>
                                        <s-table-cell>{car.brand}</s-table-cell>
                                        <s-table-cell>{car.licensePlace}</s-table-cell>
                                        <s-table-cell format="numeric">{car.year}</s-table-cell>
                                        <s-table-cell>{car.driverName || "-"}</s-table-cell>
                                        <s-table-cell>
                                            {car.fuelType.name === "Gasoline" ? "Petrol" : car.fuelType.name}
                                        </s-table-cell>
                                    </s-table-row>
                                ))}
                            </s-table-body>
                        </s-table>
                    ) : (
                        <s-banner tone="info">
                            No cars found matching your search criteria.
                        </s-banner>
                    )}
                </s-stack>
            </s-section>

            {/* Active Filters Display */}
            {(initialSearch || initialFuelType) && (
                <s-section slot="aside" heading="Active Filters">
                    <s-stack direction="block" gap="base">
                        {initialSearch && (
                            <s-badge>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>Search: {initialSearch}</span>
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            const params = new URLSearchParams(searchParams);
                                            params.delete("search");
                                            submit(params, { method: "get" });
                                        }}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "0",
                                            margin: "0",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            fontSize: "14px",
                                            lineHeight: "1",
                                            color: "inherit",
                                            opacity: "0.7",
                                            transition: "opacity 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                                        aria-label="Remove search filter"
                                    >
                                        ×
                                    </button>
                                </span>
                            </s-badge>
                        )}
                        {initialFuelType && (
                            <s-badge>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>Fuel Type: {initialFuelType === "Petrol" ? "Petrol" : initialFuelType}</span>
                                    <button
                                        onClick={() => handleFuelTypeChange("")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "0",
                                            margin: "0",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            fontSize: "14px",
                                            lineHeight: "1",
                                            color: "inherit",
                                            opacity: "0.7",
                                            transition: "opacity 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                                        aria-label="Remove fuel type filter"
                                    >
                                        ×
                                    </button>
                                </span>
                            </s-badge>
                        )}
                    </s-stack>
                </s-section>
            )}
        </s-page>
    );
}

export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};
