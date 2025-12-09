"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link'
import './cards.css'

interface RetPoint {
    id: number;
    name: string;
    location: string;
    availability_time: Record<string, string>;
    associatedCompany: boolean;
    location_link: string;
}

export default function ChristmasLocationCard(){
    const [retPoints, setRetPoints] = useState<RetPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/christmas/read?type=retirement_points')
            .then(res => res.json())
            .then((data: RetPoint[]) => {
                setRetPoints(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching retirement points:', err);
                setError('Error al cargar los puntos de retiro');
                setLoading(false);
            });
    }, []);

    function daysToInterval(availability_time: Record<string, string>): string[] {
        const daysNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        const intervals: string[] = [];
        
        // Convertir availability_time en array de [día_número, horario]
        const entries = Object.entries(availability_time)
            .map(([day, hours]) => ({ day: parseInt(day), hours }))
            .sort((a, b) => a.day - b.day);
        
        let i = 0;
        while (i < entries.length) {
            const currentHours = entries[i].hours;
            
            // Saltar días cerrados (horario "0")
            if (currentHours === "0") {
                i++;
                continue;
            }
            
            const startDay = entries[i].day;
            let endDay = startDay;
            
            // Encontrar días consecutivos con el mismo horario
            let j = i + 1;
            while (j < entries.length && entries[j].hours === currentHours && entries[j].day === endDay + 1) {
                endDay = entries[j].day;
                j++;
            }
            
            // Formatear intervalo
            if (startDay === endDay) {
                // Un solo día
                intervals.push(`${daysNames[startDay]}: ${currentHours}`);
            } else if (endDay === startDay + 1) {
                // Dos días consecutivos: usar "y"
                intervals.push(`${daysNames[startDay]} y ${daysNames[endDay]}: ${currentHours}`);
            } else {
                // Tres o más días consecutivos: usar "a"
                intervals.push(`${daysNames[startDay]} a ${daysNames[endDay]}: ${currentHours}`);
            }
            
            i = j;
        }
        
        return intervals;
    }

    if (loading) {
        return (
            <div className="christmas-location-card-container">
                <p>Cargando puntos de retiro...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="christmas-location-card-container">
                <p style={{ color: '#c00' }}>{error}</p>
            </div>
        );
    }

    return(
        <div className="christmas-location-card-container">
            <div key="roperito" className="christmas-location-card">
                <h3>Roperito Solidario</h3>
                <p>Colegio Champagnat Marcelo T de Alvear 1631 </p>
                <ul>
                    {daysToInterval({"0": "8:00-17:00", "1": "8:00-17:00", "2": "8:00-17:00", "3": "8:00-17:00", "4": "8:00-17:00"}).map((interval, idx) => (
                        <li key={idx}>{interval}</li>
                    ))}
                </ul>
                <Link href="https://maps.app.goo.gl/kmqQowYs4CANKMs57?g_st=ipc" target="_blank" rel="noopener noreferrer" className='christmas-location-link'>
                    Ver en Google Maps
                </Link>
                <p><strong>ACLARAR QUE ES PARA ROPERITO</strong></p>
            </div>
            {retPoints.map((point, index) => 
                point.associatedCompany === true ? (
                    <div key={index} className="christmas-location-card associated-company">
                        <h3>Exclusivo</h3>
                        <p>{point.name}</p>
                    </div>
                    // null
                ) : (<div key={index} className="christmas-location-card">
                        <h3>{point.name}</h3>
                        <p>{point.location}</p>
                        <ul>
                            {daysToInterval(point.availability_time).map((interval, idx) => (
                                <li key={idx}>{interval}</li>
                            ))}
                        </ul>
                        {point.location_link && (
                            <Link href={point.location_link!} target="_blank" rel="noopener noreferrer" className='christmas-location-link'>
                                Ver en Google Maps
                            </Link>
                        )}
                    </div>)
            )}
        </div>
    )
}
