module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            username: String,
            email: String,
            password: String,
            instagram: String,
            number: String,
        },
        { timestamps: true }
    );

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Usuario = mongoose.model("usuario", schema);
    return Usuario;
};
  