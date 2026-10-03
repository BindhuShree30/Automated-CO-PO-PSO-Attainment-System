import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getCourseRegistrations,
    getCourseRegistration,
    getRegistrationsByCourseOffering,
    createCourseRegistration,
    bulkRegisterStudents,
    updateCourseRegistration,
    deleteCourseRegistration,
} from "../services/courseRegistrationService";

/**
 * ---------------------------------------------------------
 * Get All Course Registrations
 * ---------------------------------------------------------
 */
export const useCourseRegistrations = () =>
    useQuery({
        queryKey: ["courseRegistrations"],
        queryFn: async () => {
            const res = await getCourseRegistrations();
            return res?.data?.data || res?.data || [];
        },
    });

/**
 * ---------------------------------------------------------
 * Get Course Registration By ID
 * ---------------------------------------------------------
 */
export const useCourseRegistration = (id) =>
    useQuery({
        queryKey: ["courseRegistration", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const res = await getCourseRegistration(id);
            return res?.data?.data || res?.data;
        },
    });

/**
 * ---------------------------------------------------------
 * Get Registrations By Course Offering
 * ---------------------------------------------------------
 *
 * Used by Faculty Course Registration page.
 */
export const useRegistrationsByCourseOffering = (courseOfferingId) =>
    useQuery({
        queryKey: [
            "courseRegistrations",
            "courseOffering",
            courseOfferingId,
        ],
        enabled: Boolean(courseOfferingId),
        queryFn: async () => {
            const res = await getRegistrationsByCourseOffering(
                courseOfferingId
            );
            return res?.data?.data || res?.data || [];
        },
    });

/**
 * ---------------------------------------------------------
 * Create Single Course Registration
 * ---------------------------------------------------------
 */
export const useCreateCourseRegistration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCourseRegistration,

        onSuccess: (_, variables) => {
            if (variables?.courseOfferingId) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "courseRegistrations",
                        "courseOffering",
                        variables.courseOfferingId,
                    ],
                });
            }

            queryClient.invalidateQueries({
                queryKey: ["courseRegistrations"],
            });
        },
    });
};

/**
 * ---------------------------------------------------------
 * Bulk Register Students
 * ---------------------------------------------------------
 */
export const useBulkRegisterStudents = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bulkRegisterStudents,

        onSuccess: (_, variables) => {
            if (variables?.courseOfferingId) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "courseRegistrations",
                        "courseOffering",
                        variables.courseOfferingId,
                    ],
                });
            }

            queryClient.invalidateQueries({
                queryKey: ["courseRegistrations"],
            });
        },
    });
};

/**
 * ---------------------------------------------------------
 * Update Course Registration
 * ---------------------------------------------------------
 */
export const useUpdateCourseRegistration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            updateCourseRegistration(id, data),

        onSuccess: (_, variables) => {
            // Invalidate all course registrations queries including offering lists
            queryClient.invalidateQueries({
                queryKey: ["courseRegistrations"],
            });

            if (variables?.id) {
                queryClient.invalidateQueries({
                    queryKey: ["courseRegistration", variables.id],
                });
            }
        },
    });
};

/**
 * ---------------------------------------------------------
 * Delete Course Registration
 * ---------------------------------------------------------
 */
export const useDeleteCourseRegistration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCourseRegistration,

        onSuccess: () => {
            // Invalidate all variants of courseRegistrations so the list immediately updates
            queryClient.invalidateQueries({
                queryKey: ["courseRegistrations"],
            });
        },
    });
};