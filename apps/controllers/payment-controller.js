const stripe = require("stripe")("sk_test_51PdqKSRpjV6aLjhk4RCLItsAnjTnCpX9xd6qcwA71QJnm8lcxsiIIeCMui6nxO6RoQYcN07If8l1R9Dn6nE1ZYHi00o5K64OBu");
const { addMonths } = require("date-fns");
const Invoice = require("../models/invoice-model");
const Gym = require("../models/gym-model");
const MemberProfile = require("../models/memberprofile-model");

const paymentController = {};

paymentController.pay = async (req, res) => {
    const checkOut = req.body

    if (!checkOut.gymSubscription) {
        return res.status(400).json({ error: "Invalid checkOut object" });
    }
    try {
        const lineItems = [{
            price_data: {
                currency: "inr",
                product_data: {
                    name: checkOut?.duration + "Months",
                },
                unit_amount: checkOut.gymPrice,
            },
            quantity: 1,
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `http://localhost:3000/success`,
            cancel_url: `http://localhost:3000/cancel`,
        });
        const result = {
            memberId: req.user.id,

            gymId: req.body.gymId,
            subscriptionId: req.body.gymSubscription,
            duration: req.body.duration,
            start: req.body.gymStartDate,
            transactionId: session.id,
            amount: checkOut.gymPrice,
            paymentType: "card",
            status: "pending",
            end: new Date(addMonths(new Date(req.body.gymStartDate), Number(req.body.duration)))

        }

        //invoice creation
        const invoiceResult = await Invoice.create(result)

        res.json({ id: session.id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
paymentController.status = async (req, res) => {
    const info = req.body.status
    if (info === "Success") {
        try {
            const pay = await Invoice.findOne({ transactionId: req.params.id })
            if (!pay) {
                return res.status(404).json({ message: 'Payment not found' })
            }
            pay.status = req.body.status

            await pay.save()
            //adding memeber to gym
            const gym = await Gym.findOne(pay.gymId)
            if (gym) {
                gym.members.push(req.user.id)
            }
            await gym.save()
            // //updating status
            const user = await MemberProfile.findOne({ userId: req.user.id })
            if (user) {
                user.active = true
                user.invoiceId = pay._id
            }
            await user.save()

        }
        catch (err) {
            console.log(err)
        }

    }
    else if (info === "Failed") {
        try {
            const pay = await Invoice.findOneAndDelete({ transactionId: req.params.id })
        }
        catch (err) {
            console.log(err)
        }
    }

}
paymentController.getPlan = async (req, res) => {
    try {
        const result = await Invoice.findOne({ memberId: req.user.id }).populate("gymId").populate("memberId")
        if (!result) {

            return res.json({ message: "No plan found" })

        }
        const planres = await Gym.findById(result.gymId)
        const plan = planres.subscription.filter((ele, i) => {
            
            if (ele._id ==result.subscriptionId) {
                return ele
            }
        })
       
        return res.json({ result: result, plan: plan })

    }
    catch (err) {
        console.log(err)
    }
}
module.exports = paymentController;
