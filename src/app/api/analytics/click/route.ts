import { recordAnalyticsEvent } from "../route";
export async function POST(request: Request) { return recordAnalyticsEvent(request, "LINK_CLICK"); }
