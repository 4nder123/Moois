export function useLoader() {
    const isLoading = ref(false);
    const delay = 300;
    let timeout: NodeJS.Timeout;
    
    function startLoader() {
        timeout = setTimeout(() => isLoading.value = true, delay);
    }

    function stopLoader() {
        clearTimeout(timeout);
        isLoading.value = false;
    }

    return {
        isLoading,
        startLoader,
        stopLoader
    }
};
