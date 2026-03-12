import { sendMail } from "../send/route";
import { User, Child } from "../models";
import { env } from "process";

// Campaign disabled
const CHRISTMAS_DISABLED = true;

export async function GET() {
    if (CHRISTMAS_DISABLED) return new Response('Christmas campaign is disabled', { status: 503 });
    const noCardChildren = await Child.findAll({ where: { card: false } });
    const fails : number[] = [];


    for (const child of noCardChildren) {
        const childId = child.get('idchildren') as number;
        const childName = child.get('name') as string;
        const childHouse = child.get('house') as string;
        const childCardUrl = `${childHouse.toUpperCase().replace(/\s+/g, '_')}_${childName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').toUpperCase()}.pdf`;
        try{
            await fetch(`${env.IMAGES_URL}cards/${childCardUrl}`, { method: 'HEAD' });
            await child.update({ childrenid: childId, card: true });
            // El archivo existe, puedes realizar acciones adicionales aquí
            if(!child.get('available') as boolean){
                const user = await User.findOne({ where: { childrenid: childId } });
                if(user){
                    sendMail(user.get('email') as string, user.get('name') as string, childId);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2100));
        } catch (error){
            console.error(`Error accessing file for child ID ${childId}:`, error);
            console.log(childCardUrl)
            fails.push(childId);
        }
    }
    return new Response("All cards processed, fails: " + JSON.stringify(fails), { status: 200 });
    

}
