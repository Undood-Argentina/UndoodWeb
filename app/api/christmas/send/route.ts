import { env } from 'process';
import { User, Child } from '../models';
import { Resend } from 'resend';
import { 
    ChristmasErrorCodes, 
    createErrorResponse, 
    createSuccessResponse 
} from '../errors';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Campaign disabled
const CHRISTMAS_DISABLED = true;

interface NewUserBody {
    name: string;
    email: string;
    cel?: string;
    company?: string;
    children_id?: number | null;
}

//auxiliary functions

function decimalToMonths(value:number){
    const month = value * 12;
    if (month < 0.9) {
        return Math.floor(month);
    }
    else{
        return Math.ceil(month);
    }
}

//


async function addUser(body: NewUserBody) {
    const { name, email, cel, company } = body;
    try {
        const userMail = await User.findOne({ where: { email } });
        if(userMail) {
            return createErrorResponse(ChristmasErrorCodes.USER_ALREADY_EXISTS, 400);
        }
        const user = await User.create({ name, email, cel, company });
        return createSuccessResponse('Usuario creado correctamente', 201, user);
    } catch (error) {
        return createErrorResponse(
            ChristmasErrorCodes.DATABASE_ERROR, 
            500, 
            (error as Error).message
        );
    }
}

async function asignChildrenToUser(userId: number, childrenId: number) {
    try {
        const child = await Child.findOne({ 
            where: { idchildren: childrenId },
            attributes: ['available']
        });
        
        if(!child) {
            return createErrorResponse(ChristmasErrorCodes.CHILD_NOT_FOUND, 404);
        }
        
        const isAvailable = child.get('available') as boolean;
        
        if(!isAvailable) {
            return createErrorResponse(ChristmasErrorCodes.CHILD_ALREADY_ASSIGNED, 400);
        }
        
        await Child.update(
            { available: false },
            { where: { idchildren: childrenId } }
        );
    } catch (error) {
        return createErrorResponse(
            ChristmasErrorCodes.DATABASE_ERROR, 
            500, 
            (error as Error).message
        );
    }
    try {
        await User.update(
            { childrenid: childrenId },
            { where: { idusers: userId } }
        );
    } catch (error) {
        return createErrorResponse(
            ChristmasErrorCodes.DATABASE_ERROR, 
            500, 
            (error as Error).message
        );
    }
    return createSuccessResponse('Niño/a asignado correctamente');
}

export async function sendMail(to: string, userName: string, childrenId: number | null) {
    
    let child = null;

    if(childrenId != null){
        child = await Child.findByPk(childrenId, {
            attributes: ['name', 'age', 'house', 'gifts', 'card']
        });
        if(!child){
            return createErrorResponse(
                ChristmasErrorCodes.CHILD_NOT_FOUND, 
                404, 
                'Niño/a no encontrado'
            );
        }
    }

    if (child !== null) {
        const childName = child.get('name') as string;
        const childAge = child.get('age') as number;
        const childHouse = child.get('house') as string;
        const childGifts = child.get('gifts') as string;
        const childCard = child.get('card') as boolean;
        const childCardUrl = `${childHouse.toUpperCase().replace(/\s+/g, '_')}_${childName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').toUpperCase()}.pdf`;
    
        let html: string;
        if (!childCard) {
            html = `<html><body><img src="${env.IMAGES_URL}emailImages/no-card.png" alt="No card available"></body></html>`;
        }
        else{
            html = `<html dir="ltr" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns="http://www.w3.org/1999/xhtml" lang="es">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="format-detection" content="telephone=no">
            <style type="text/css">
            .rollover:hover .rollover-first {
            max-height:0px!important;
            display:none!important;
            }
            .rollover:hover .rollover-second {
            max-height:none!important;
            display:block!important;
            }
            .rollover span {
            font-size:0px;
            }
            u + .body img ~ div div {
            display:none;
            }
            #outlook a {
            padding:0;
            }
            span.MsoHyperlink,
            span.MsoHyperlinkFollowed {
            color:inherit;
            mso-style-priority:99;
            }
            a.es-button {
            mso-style-priority:100!important;
            text-decoration:none!important;
            }
            a[x-apple-data-detectors],
            #MessageViewBody a {
            color:inherit!important;
            text-decoration:none!important;
            font-size:inherit!important;
            font-family:inherit!important;
            font-weight:inherit!important;
            line-height:inherit!important;
            }
            .es-desk-hidden {
            display:none;
            float:left;
            overflow:hidden;
            width:0;
            max-height:0;
            line-height:0;
            mso-hide:all;
            }
            @media only screen and (max-width:600px) {.es-m-p20b { padding-bottom:20px!important } .es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:40px!important; text-align:left } h2 { font-size:32px!important; text-align:left } h3 { font-size:28px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:40px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:32px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:28px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:14px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu.es-table-not-adapt { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-adapt-td { display:block!important; width:100%!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-container-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .es-text-6118 .es-text-mobile-size-16, .es-text-6118 .es-text-mobile-size-16 * { font-size:16px!important } }
            @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
            </style>
            </head>
            <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
            <div dir="ltr" class="es-wrapper-color" lang="es" style="background-color:#F6F6F6"><!--[if gte mso 9]>
                    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                        <v:fill type="tile" color="#f6f6f6"></v:fill>
                    </v:background>
                    <![endif]-->
            <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-color:#F6F6F6">
                <tr>
                <td valign="top" style="padding:0;Margin:0">
                <table align="center" cellspacing="0" cellpadding="0" class="es-header" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent">
                    <tr>
                    <td align="center" style="padding:0;Margin:0">
                    <table cellpadding="0" bgcolor="#ffffff" align="center" cellspacing="0" class="es-header-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;background-color:#FFFFFF;width:600px">
                        <tr>
                        <td bgcolor="#054d79" align="left" style="padding:0;Margin:0;padding-top:20px;padding-right:20px;padding-left:20px;background-color:#054d79">
                        <table align="left" cellspacing="0" cellpadding="0" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;float:left">
                            <tr>
                            <td valign="top" align="center" class="es-m-p20b" style="padding:0;Margin:0;width:560px">
                            <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px">
                                <tr>
                                <td align="center" style="padding:0;Margin:0;font-size:0"><img src="${env.IMAGES_URL}emailImages/banner-christmas-mail.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                                </tr>
                            </table></td>
                            </tr>
                        </table></td>
                        </tr>
                    </table></td>
                    </tr>
                </table>
                <table cellpadding="0" align="center" cellspacing="0" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;width:100%;table-layout:fixed !important">
                    <tr>
                    <td align="center" style="padding:0;Margin:0">
                    <table align="center" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="es-content-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;background-color:#FFFFFF;width:600px">
                        <tr>
                        <td align="left" bgcolor="#054d79" style="padding:0;Margin:0;padding-top:20px;padding-right:20px;padding-left:20px;background-color:#054d79">
                        <table cellpadding="0" width="100%" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px">
                            <tr>
                            <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                            <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px">
                                <tr>
                                <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">Hola ${userName}, ¡vas a ser Papá /&nbsp;Mamá Noel&nbsp;de&nbsp;<strong>${childName}!</strong><br><br>${childName} ${childAge < 99 ? `tiene ${childAge >= 1 ? childAge + ' años' : decimalToMonths(childAge) + ' meses' }`: ""}y está en el&nbsp;<strong>Hogar ${childHouse}.</strong>&nbsp;y en su carta, que también te adjuntamos, pidió:<br><br><strong>${childGifts}</strong><br><br>Recordá que tenés entre el <strong>VIERNES 14 DE NOVIEMBRE</strong> y el <strong>DOMINGO 15 DE DICIEMBRE</strong>&nbsp;al horario de cierre de cada local, para preparar el regalo y llevarlo a alguno de los puntos de recepción de regalos habilitados. No te olvides de ponerle una<strong> tarjeta con nombre, edad y hogar para que lo podamos identificar.</strong></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><strong><br></strong></p><p style="font-family:-apple-system,BlinkMacSystemFont,&#39;Segoe UI&#39;,Roboto,Helvetica,Arial,sans-serif,&#39;Apple Color Emoji&#39;,&#39;Segoe UI Emoji&#39;,&#39;Segoe UI Symbol&#39;;color:#fefdfd">
                                                    Para tener en cuenta: NO<strong> es necesario comprar todo lo que aparece en la carta.</strong> Podés elegir uno o dos regalos simples y acordes a la edad. Y si algo de lo pedido no se ajusta a tus posibilidades, podés reemplazarlo por un regalo similar y adecuado.&nbsp;
                                                  </p></td>
                                </tr> 
                                <tr>
                                <td align="left" class="es-text-6118" style="padding:0;Margin:0"><p class="es-text-mobile-size-16" style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:24px;letter-spacing:0;color:#fefdfd;font-size:16px"><strong>Conocé todos los puntos de recepción haciendo click acá:&nbsp;</strong></p><p class="es-text-mobile-size-16" style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:24px;letter-spacing:0;color:#fefdfd;font-size:16px"><strong><br></strong></p></td>
                                </tr>
                                <tr>
                                <td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#6fa8dc;border-width:0px 0px 2px 0px;display:inline-block;border-radius:15px;width:auto"><a href="https://undoodargentina.com.ar/christmas#retPoints" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px 10px 20px;display:inline-block;background:#6fa8dc;border-radius:15px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-weight:bold;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #6fa8dc">PUNTOS DE RECEPCIÓN</a></span></td>
                                </tr>
                                <tr>
                                <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px"><br></p></td>
                                </tr>
                            </table></td>
                            </tr>
                        </table></td>
                        </tr>
                    </table></td>
                    </tr>
                </table>
                <table cellspacing="0" cellpadding="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent">
                    <tr>
                    <td align="center" style="padding:0;Margin:0">
                    <table align="center" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="es-footer-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;background-color:#FFFFFF;width:600px">
                        <tr>
                        <td align="left" bgcolor="#054d79" style="Margin:0;padding-top:20px;padding-right:20px;padding-left:20px;padding-bottom:20px;background-color:#054d79">
                        <table align="left" cellspacing="0" cellpadding="0" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;float:left">
                            <tr>
                            <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:560px">
                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px">
                                <tr>
                                <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px"><strong>IMPORTANTE TENER EN CUENTA - QUE NO REGALAR</strong></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px"><strong><br></strong></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">Nos parece importante contarte que debido a la situación tan delicada de los niños y las niñas que están en los hogares, intentamos no fomentar la violencia ni la agresión así como tampoco revivir feos recuerdos. Por eso te pedimos que por más que lo pidan en la carta NO REGALES:</p>
                                <ul style="font-family:arial, 'helvetica neue', helvetica, sans-serif;padding:0px 0px 0px 40px;margin-top:15px;margin-bottom:15px">
                                    <li style="color:#333333;margin:0px 0px 15px;font-size:14px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"><p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px;mso-margin-top-alt:15px">ARMAS DE NINGÚN TIPO</p></li>
                                    <li style="color:#333333;margin:0px 0px 15px;font-size:14px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"><p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">ELEMENTOS CORTO PUNZANTES (como tijeras o herramientas de construcción)</p></li>
                                    <li style="color:#333333;margin:0px 0px 15px;font-size:14px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"><p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">DINERO</p></li>
                                    <li style="color:#333333;margin:0px 0px 15px;font-size:14px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"><p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">NADA MUY OSTENTOSO (no queremos generar diferencias, para ellos a todos les esta regalando algo papá y&nbsp;mamá Noel, seamos medidos con los regalos: nada muy sencillo ni nada muy ostentoso, un punto medio).</p></li>
                                </ul><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px">También te pedimos que bajo ningún punto de vista dejes en la tarjeta datos personales tales como teléfono, mail, dirección o perfil de redes sociales.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;letter-spacing:0;color:#fefdfd;font-size:14px"><br></p></td>
                                </tr>
                                <tr>
                                <td align="center" style="padding:0;Margin:0;font-size:0"><img src="${env.IMAGES_URL}emailImages/footer-christmas-mail.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                                </tr>
                            </table></td>
                            </tr>
                        </table></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
            </table>
            </div>
            </body>
        </html>`;
        }
        try {
            console.log(childCardUrl);
            const attachments= childCard ? [{filename: 'Carta_Navidad.pdf',
                        path:`${env.IMAGES_URL}cards/${childCardUrl}`}] : undefined;
            const res = await resend.emails.send({
                from:'info@undoodargentina.com.ar',
                to: to,
                subject: 'Bienvenido a la campaña de Navidad',
                html: html,
                attachments: attachments
            });
            console.log(res);
            return createSuccessResponse('Email enviado correctamente');
        } catch (error) {
            return createErrorResponse(
                ChristmasErrorCodes.EMAIL_SEND_ERROR, 
                500, 
                (error as Error).message
            );
        }
    }
    else {
        const html = `<html><body><img src="${env.IMAGES_URL}emailImages/waiting-list.png" alt="Lista de espera"></body></html>`;
        try{
            const res = await resend.emails.send({
                from:'info@undoodargentina.com.ar',
                to: to,
                subject: 'Lista de espera campaña de Navidad',
                html: html
            });
            console.log(res);
            return createSuccessResponse('Email enviado correctamente');
        } catch (error) {
            return createErrorResponse(
                ChristmasErrorCodes.EMAIL_SEND_ERROR, 
                500, 
                (error as Error).message
            );
        }
    }
    
}

export async function POST(req: Request) {
    if (CHRISTMAS_DISABLED) return new Response('Christmas campaign is disabled', { status: 503 });
    const body = await req.json() as NewUserBody;

    const userResponse = await addUser(body);
    if (userResponse.status !== 201) {
        return userResponse;
    }
    const userData = await userResponse.json() as { data: { idusers: number } };
    if (body.children_id != null && body.children_id !== undefined) {
        const assignResponse = await asignChildrenToUser(userData.data.idusers, body.children_id);
        console.log(assignResponse);
        if (assignResponse.status !== 200) {
            return assignResponse;
        }
    } else {
        console.log('No se asignó ningún niño/a al usuario');
    }

    console.log(body);
    return await sendMail(body.email, body.name, body.children_id || null); ;
}