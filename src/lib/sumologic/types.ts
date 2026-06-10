export interface IJob {
  status: number;
  id: string;
  code: string;
  message: string;
}

export interface IHistogramBucket {
  length: number;
  count: number;
  startTimestamp: number;
}

// Neither structure is specified at
// https://help.sumologic.com/APIs/02Search_Job_API/About_the_Search_Job_API
export type SumoJobError = unknown;
export type SumoJobWarning = unknown;

export interface IStatus {
  state: string;
  messageCount: number;
  histogramBuckets: IHistogramBucket[];
  pendingErrors: SumoJobError[];
  pendingWarnings: SumoJobWarning[];
  recordCount: number;
}

export interface IField {
  name: string;
  fieldType: string;
  keyField: boolean;
}

export interface IMessage {
  map: { [key: string]: string };
}

export interface IMessages {
  fields: IField[];
  messages: IMessage[];
}

export interface IRecords {
  fields: IField[];
  records: IMessage[];
}

export interface IClientOptions {
  endpoint: string;
  sumoApiId: string;
  sumoApiKey: string;
}

export interface IJobOptions {
  query: string;
  from: string;
  to: string;
  timeZone: string;
}

export interface IPaginationOptions {
  offset: number;
  limit: number;
}
