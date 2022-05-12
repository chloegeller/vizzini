import _ from "lodash";
import Papa from "papaparse";

function JSONtoCSV(data, {prolificID, studyID}) {
    data = data.filter({ trial_type: "FinalForm", }).values()
    const CSV = data.map((entry) => {
        const omitted = _.omit(entry, ["sessionID", "prolificID", "studyID"])
        return {
            prolificID,
            studyID,
            ...omitted,
        };
    });
    return Papa.unparse(CSV);
}

export async function finishStudy(jsPsych, environment) {
    const error = document.createElement("div");
    error.classList.add("alert", "alert-danger");
    error.innerText = "Something went wrong. Please contact us on Prolific.";

    try {
        const _CSV = await jsPsych.extensions.jatos.uploadCSV(JSONtoCSV)
        // console.log(_CSV)
        const _JSON = await jsPsych.extensions.jatos.uploadJSON()
        const resultData = await jsPsych.extensions.jatos.uploadResultData()
        await jsPsych.extensions.jatos.endStudy()
    } catch (e) {
        if (environment === "development") jsPsych.data.displayData();
        else {
            jsPsych.getDisplayElement().clear();
            jsPsych.getDisplayElement().appendChild(error);
        }
        console.log(e, e.message);
        console.log(jsPsych.data.get().json());
        console.log(jsPsych.data);
    }
}
