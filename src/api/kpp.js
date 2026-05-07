import axios from "axios";

const kppClient = axios.create({
  baseURL: "https://172.16.55.13:8012/api/kpp",
  timeout: 60000,
});

export const syncKppCars = (day) =>
  kppClient.post("/sync/cars", null, { params: { day } }).then((r) => r.data);

export const syncEmployees = () =>
  kppClient.post("/sync/employees").then((r) => r.data);

export const syncEmployeeEvents = ({ employee_id, day }) =>
  kppClient
    .post("/sync/employee-events", null, {
      params: { employee_id, day },
    })
    .then((r) => r.data);

export const getKppCars = (day) =>
  kppClient.get("/cars", { params: { day } }).then((r) => r.data);

export const getEmployees = (params = {}) =>
  kppClient.get("/employees", { params }).then((r) => r.data);

export const getEmployeeDetail = (tabNumber) =>
  kppClient.get(`/employees/${tabNumber}`).then((r) => r.data);

export const getEmployeeEvents = ({ employee_id, day }) =>
  kppClient
    .get("/employee-events", { params: { employee_id, day } })
    .then((r) => r.data);

export const getKppAnalytics = (day) =>
  kppClient.get("/analytics", { params: { day } }).then((r) => r.data);
