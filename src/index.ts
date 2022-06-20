export interface SampleInterface {
    sampleFunction: () => void;
}

export const implementation: SampleInterface = {
    sampleFunction: () => {
        console.log("samle function");
    },
};
