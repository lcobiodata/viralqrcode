/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default function handler(req, res) {
  res.status(200).json({
    data: process.env.HIDDEN_DATA_VALUE || ""
  });
}