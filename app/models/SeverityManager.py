from app.database import fake_database
from dash import Dash, html, dcc, Input, Output
from dash.dash_table import DataTable
import plotly.express as px

#print(fake_database.database)

priority_mapping = {
    "urgent":1,
    "high":2,
    "medium":3,
    "low":4,
    "none":5
}

incidents = fake_database.database["Incidents"]
def sort_severity(incidents):
    sorted_incidents = sorted(
        incidents,
        key=lambda incident: priority_mapping.get(incident["Priority"], 999)
    )
    return sorted_incidents


#print(sort_severity(incidents))

def filter_by_severity(incidents, severity):
    filtered_incidents = [incident for incident in incidents if incident["Priority"].lower() == severity.lower()]
    return filtered_incidents

print(filter_by_severity(incidents, "urgent"))


def map_make(incidents):
    lats = [d["Latitude"] for d in incidents]
    lons = [d["Longitude"] for d in incidents]
    names = [d["Title"] for d in incidents]
    RiskLevel = [d["Priority"] for d in incidents]

    color_map = {
    "urgent": "crimson",
    "high": "orange",
    "medium": "yellow",
    "low": "darkgreen",
    "none": "gray"}

    fig = px.scatter_mapbox(
        lat=lats,
        lon=lons,
        hover_name=names,
        zoom=3,
        height=1000,
        color=RiskLevel,
        color_discrete_map=color_map,
     )
    




    
    
    fig.update_traces(marker=dict(size=10,))
    fig.update_layout(
        mapbox_style="open-street-map",
        autosize=True
    )
    print(incidents[:3])
    print(lats[:3], lons[:3])

    fig.show()

map_make(incidents) # 